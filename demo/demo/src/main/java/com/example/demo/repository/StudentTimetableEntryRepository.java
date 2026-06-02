package com.example.demo.repository;

import com.example.demo.entity.StudentTimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentTimetableEntryRepository extends JpaRepository<StudentTimetableEntry, Long> {
    List<StudentTimetableEntry> findByStudentUsernameAndSemester(String studentUsername, String semester);
    boolean existsByStudentUsernameAndOfferingIdAndSemester(String studentUsername, Long offeringId, String semester);
}
