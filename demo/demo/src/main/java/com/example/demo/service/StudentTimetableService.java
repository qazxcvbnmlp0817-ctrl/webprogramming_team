package com.example.demo.service;

import com.example.demo.dto.LectureOfferingDto;
import com.example.demo.dto.TimetableEntryDto;
import com.example.demo.entity.LectureOffering;
import com.example.demo.entity.StudentTimetableEntry;
import com.example.demo.entity.User;
import com.example.demo.repository.LectureOfferingRepository;
import com.example.demo.repository.StudentTimetableEntryRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class StudentTimetableService {
    private static final Pattern DAY_BLOCK = Pattern.compile("([월화수목금토일])([0-9,]+)");

    private final UserRepository userRepository;
    private final LectureOfferingRepository offeringRepository;
    private final StudentTimetableEntryRepository entryRepository;

    public StudentTimetableService(
            UserRepository userRepository,
            LectureOfferingRepository offeringRepository,
            StudentTimetableEntryRepository entryRepository) {
        this.userRepository = userRepository;
        this.offeringRepository = offeringRepository;
        this.entryRepository = entryRepository;
    }

    public List<LectureOfferingDto> getOfferings(String semester, String departmentName) {
        List<LectureOffering> offerings = (departmentName == null || departmentName.isBlank())
                ? offeringRepository.findBySemesterOrderByCourseCodeAscSectionAsc(semester)
                : offeringRepository.findBySemesterAndDepartmentNameContainingOrderByCourseCodeAscSectionAsc(semester, departmentName);
        return offerings.stream().map(LectureOfferingDto::from).toList();
    }

    public List<TimetableEntryDto> getMyTimetable(String username, String semester) {
        assertStudent(username);
        return entryRepository.findByStudentUsernameAndSemester(username, semester).stream()
                .map(entry -> offeringRepository.findById(entry.getOfferingId())
                        .map(offering -> new TimetableEntryDto(entry.getId(), LectureOfferingDto.from(offering)))
                        .orElse(null))
                .filter(Objects::nonNull)
                .toList();
    }

    @Transactional
    public TimetableEntryDto add(String username, Long offeringId) {
        assertStudent(username);
        LectureOffering offering = offeringRepository.findById(offeringId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "강좌를 찾을 수 없습니다."));
        String semester = offering.getSemester();

        if (entryRepository.existsByStudentUsernameAndOfferingIdAndSemester(username, offeringId, semester)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 시간표에 담은 강좌입니다.");
        }

        List<LectureOffering> currentOfferings = entryRepository.findByStudentUsernameAndSemester(username, semester).stream()
                .map(entry -> offeringRepository.findById(entry.getOfferingId()).orElse(null))
                .filter(Objects::nonNull)
                .toList();
        Optional<LectureOffering> conflict = currentOfferings.stream()
                .filter(existing -> conflicts(existing.getLectureTime(), offering.getLectureTime()))
                .findFirst();
        if (conflict.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "시간이 겹칩니다: " + conflict.get().getCourseName() + " " + conflict.get().getSection() + "분반");
        }

        StudentTimetableEntry entry = new StudentTimetableEntry();
        entry.setStudentUsername(username);
        entry.setOfferingId(offeringId);
        entry.setSemester(semester);
        entry.setCreatedAt(LocalDateTime.now());
        entryRepository.save(entry);

        return new TimetableEntryDto(entry.getId(), LectureOfferingDto.from(offering));
    }

    @Transactional
    public void remove(String username, Long entryId) {
        assertStudent(username);
        StudentTimetableEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "시간표 항목을 찾을 수 없습니다."));
        if (!username.equals(entry.getStudentUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "자신의 시간표만 수정할 수 있습니다.");
        }
        entryRepository.delete(entry);
    }

    private void assertStudent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
        if (!"student".equals(user.getMemberType())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학생 계정만 시간표를 작성할 수 있습니다.");
        }
    }

    private boolean conflicts(String left, String right) {
        Set<String> leftSlots = toSlots(left);
        Set<String> rightSlots = toSlots(right);
        return leftSlots.stream().anyMatch(rightSlots::contains);
    }

    private Set<String> toSlots(String lectureTime) {
        if (lectureTime == null) return Set.of();
        Matcher matcher = DAY_BLOCK.matcher(lectureTime.replaceAll("\\s+", ""));
        Set<String> slots = new HashSet<>();
        while (matcher.find()) {
            String day = matcher.group(1);
            for (String period : matcher.group(2).split(",")) {
                if (!period.isBlank()) slots.add(day + period);
            }
        }
        return slots;
    }
}
