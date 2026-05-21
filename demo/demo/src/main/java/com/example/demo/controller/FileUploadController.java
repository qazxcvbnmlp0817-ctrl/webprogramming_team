package com.example.demo.controller;

import com.example.demo.dto.PostAttachmentDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
public class FileUploadController {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/api/upload")
    public ResponseEntity<List<PostAttachmentDto>> upload(
            @RequestParam("files") MultipartFile[] files) throws IOException {

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        List<PostAttachmentDto> result = new ArrayList<>();
        for (MultipartFile file : files) {
            String original = file.getOriginalFilename();
            String ext = "";
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf('.'));
            }
            String saved = UUID.randomUUID() + ext;
            Files.copy(file.getInputStream(), dir.resolve(saved),
                       StandardCopyOption.REPLACE_EXISTING);

            String contentType = file.getContentType() != null ? file.getContentType() : "";
            boolean isImage = contentType.startsWith("image/");

            result.add(new PostAttachmentDto(
                null,
                original,
                "/uploads/" + saved,
                file.getSize(),
                contentType,
                isImage
            ));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> serve(@PathVariable String filename) throws IOException {
        Path file = Paths.get(uploadDir).resolve(filename);
        Resource resource = new UrlResource(file.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }
        String contentType = Files.probeContentType(file);
        if (contentType == null) contentType = "application/octet-stream";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }
}
