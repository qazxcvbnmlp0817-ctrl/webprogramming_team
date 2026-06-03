package com.example.demo.util;

import com.example.demo.entity.ClassSchedule;
import com.example.demo.entity.CurriculumItem;
import com.example.demo.entity.LectureOffering;
import com.example.demo.entity.Professor;
import com.example.demo.entity.ProfessorCourseAssignment;
import com.example.demo.repository.ClassScheduleRepository;
import com.example.demo.repository.CurriculumItemRepository;
import com.example.demo.repository.LectureOfferingRepository;
import com.example.demo.repository.ProfessorCourseAssignmentRepository;
import com.example.demo.repository.ProfessorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Order(9)
public class LectureOfferingClassScheduleSyncInitializer implements CommandLineRunner {

    private static final String SEMESTER = "2026-1";
    private static final int FIRST_PERIOD_START_MIN = 9 * 60;
    private static final int PERIOD_MINUTES = 30;

    private final LectureOfferingRepository lectureOfferingRepository;
    private final ProfessorRepository professorRepository;
    private final CurriculumItemRepository curriculumItemRepository;
    private final ProfessorCourseAssignmentRepository assignmentRepository;
    private final ClassScheduleRepository classScheduleRepository;

    public LectureOfferingClassScheduleSyncInitializer(
            LectureOfferingRepository lectureOfferingRepository,
            ProfessorRepository professorRepository,
            CurriculumItemRepository curriculumItemRepository,
            ProfessorCourseAssignmentRepository assignmentRepository,
            ClassScheduleRepository classScheduleRepository) {
        this.lectureOfferingRepository = lectureOfferingRepository;
        this.professorRepository = professorRepository;
        this.curriculumItemRepository = curriculumItemRepository;
        this.assignmentRepository = assignmentRepository;
        this.classScheduleRepository = classScheduleRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Map<String, List<Professor>> professorsByName = professorRepository.findAll().stream()
                .collect(Collectors.groupingBy(professor -> normalize(professor.getName())));
        Map<Long, List<CurriculumItem>> coursesByDept = curriculumItemRepository.findAll().stream()
                .collect(Collectors.groupingBy(CurriculumItem::getDeptId));

        for (LectureOffering offering : lectureOfferingRepository.findBySemesterOrderByCourseCodeAscSectionAsc(SEMESTER)) {
            for (String professorName : splitProfessorNames(offering.getProfessorName())) {
                List<Professor> candidates = professorsByName.getOrDefault(normalize(professorName), List.of());
                // LectureOffering has no professor FK; sync only when professorName uniquely identifies one professor.
                if (candidates.size() != 1) continue;

                Professor professor = candidates.get(0);
                CurriculumItem course = findCourse(coursesByDept.getOrDefault(professor.getDeptId(), List.of()), offering);
                if (course == null) continue;

                assignIfAbsent(professor, course);
                saveSchedulesIfAbsent(professor, course, offering);
            }
        }
    }

    private List<String> splitProfessorNames(String value) {
        if (value == null || value.isBlank()) return List.of();
        List<String> names = new ArrayList<>();
        for (String token : value.split("[,，/\\s]+")) {
            String name = token.trim();
            if (!name.isEmpty()) names.add(name);
        }
        return names;
    }

    private CurriculumItem findCourse(List<CurriculumItem> courses, LectureOffering offering) {
        String offeringName = normalize(offering.getCourseName());
        return courses.stream()
                .filter(course -> normalize(course.getName()).equals(offeringName))
                .findFirst()
                .orElse(null);
    }

    private void assignIfAbsent(Professor professor, CurriculumItem course) {
        if (assignmentRepository.existsByProfessorIdAndCourseId(professor.getId(), course.getId())) return;
        ProfessorCourseAssignment assignment = new ProfessorCourseAssignment();
        assignment.setProfessorId(professor.getId());
        assignment.setCourseId(course.getId());
        assignment.setDeptId(professor.getDeptId());
        assignmentRepository.save(assignment);
    }

    private void saveSchedulesIfAbsent(Professor professor, CurriculumItem course, LectureOffering offering) {
        for (ScheduleBlock block : parseScheduleBlocks(offering.getLectureTime())) {
            boolean exists = classScheduleRepository
                    .findByProfessorIdAndSemester(professor.getId(), SEMESTER)
                    .stream()
                    .anyMatch(schedule -> course.getId().equals(schedule.getCourseId())
                            && block.day().equals(schedule.getDayOfWeek())
                            && block.startTime().equals(schedule.getStartTime())
                            && block.endTime().equals(schedule.getEndTime()));
            if (exists) continue;

            ClassSchedule schedule = new ClassSchedule();
            schedule.setProfessorId(professor.getId());
            schedule.setCourseId(course.getId());
            schedule.setDeptId(professor.getDeptId());
            schedule.setDayOfWeek(block.day());
            schedule.setStartTime(block.startTime());
            schedule.setEndTime(block.endTime());
            schedule.setRoom("강의실 미정");
            schedule.setSemester(SEMESTER);
            schedule.setMemo("LectureOffering 기반 자동 동기화");
            schedule.setCreatedAt(LocalDateTime.now());
            schedule.setUpdatedAt(LocalDateTime.now());
            classScheduleRepository.save(schedule);
        }
    }

    private List<ScheduleBlock> parseScheduleBlocks(String lectureTime) {
        if (lectureTime == null || lectureTime.isBlank() || lectureTime.contains("미정")) {
            return List.of();
        }
        List<ScheduleBlock> blocks = new ArrayList<>();
        for (String token : lectureTime.trim().split("\\s+")) {
            if (token.length() < 2) continue;
            String day = token.substring(0, 1);
            String periodPart = token.substring(1);
            if (periodPart.isBlank() || !Character.isDigit(periodPart.charAt(0))) continue;

            List<Integer> periods = new ArrayList<>();
            for (String rawPeriod : periodPart.split(",")) {
                try {
                    int period = Integer.parseInt(rawPeriod);
                    if (period > 0) periods.add(period);
                } catch (NumberFormatException ignored) {
                }
            }
            periods.sort(Comparator.naturalOrder());
            if (periods.isEmpty()) continue;

            List<Integer> group = new ArrayList<>();
            for (int period : periods) {
                if (!group.isEmpty() && group.get(group.size() - 1) + 1 != period) {
                    blocks.add(toBlock(day, group));
                    group.clear();
                }
                group.add(period);
            }
            if (!group.isEmpty()) blocks.add(toBlock(day, group));
        }
        return blocks;
    }

    private ScheduleBlock toBlock(String day, List<Integer> periods) {
        int startMin = FIRST_PERIOD_START_MIN + (periods.get(0) - 1) * PERIOD_MINUTES;
        int endMin = FIRST_PERIOD_START_MIN + periods.get(periods.size() - 1) * PERIOD_MINUTES;
        return new ScheduleBlock(day, formatTime(startMin), formatTime(endMin));
    }

    private String formatTime(int minutes) {
        int hour = minutes / 60;
        int minute = minutes % 60;
        return "%02d:%02d".formatted(hour, minute);
    }

    private String normalize(String value) {
        if (value == null) return "";
        return value.replaceAll("\\s+", "").trim();
    }

    private record ScheduleBlock(String day, String startTime, String endTime) {}
}
