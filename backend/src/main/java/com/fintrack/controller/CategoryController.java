package com.fintrack.controller;

import com.fintrack.dto.CategoryDto;
import com.fintrack.enums.CategoryType;
import com.fintrack.security.UserPrincipal;
import com.fintrack.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/categories", "/api/v1/categories"})
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "type", required = false) CategoryType type) {
        List<CategoryDto> categories = (type != null)
                ? categoryService.getCategoriesByType(userPrincipal.getId(), type)
                : categoryService.getCategoriesForUser(userPrincipal.getId());
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CategoryDto request) {
        CategoryDto created = categoryService.createCustomCategory(
                userPrincipal.getId(), request.name(), request.categoryType());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long id) {
        categoryService.deleteCustomCategory(userPrincipal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
