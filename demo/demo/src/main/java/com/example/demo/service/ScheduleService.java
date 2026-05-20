package com.example.demo.service;

import com.example.demo.dto.ScheduleDto;
import com.example.demo.entity.Schedule;
import com.example.demo.repository.ScheduleRepository;
import com.example.demo.util.DummyDataHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    public List<ScheduleDto> getSchedulesByDept(Long deptId) {
        List<Schedule> schedules = scheduleRepository
                .findByScopeTypeAndScopeIdOrderByEventDateAsc("dept", deptId);
        if (schedules.isEmpty()) return DummyDataHelper.getSchedulesByDept(deptId);
        return schedules.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ScheduleDto> getSchedulesByFaculty(Long facultyId) {
        List<Schedule> schedules = scheduleRepository
                .findByScopeTypeAndScopeIdOrderByEventDateAsc("faculty", facultyId);
        if (schedules.isEmpty()) return DummyDataHelper.getSchedulesByFaculty(facultyId);
        return schedules.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ScheduleDto> getSchedulesByUniv(Long univId) {
        List<Schedule> schedules = scheduleRepository
                .findByScopeTypeAndScopeIdOrderByEventDateAsc("univ", univId);
        if (schedules.isEmpty()) return DummyDataHelper.getUniversitySchedules(univId);
        return schedules.stream().map(this::toDto).collect(Collectors.toList());
    }

    public Schedule save(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    private ScheduleDto toDto(Schedule s) {
        int dday = (int) ChronoUnit.DAYS.between(LocalDate.now(), s.getEventDate());
        return new ScheduleDto(
                s.getId(),
                s.getTitle(),
                s.getEventDate().toString(),
                dday,
                s.getCategory()
        );
    }
}
