package pl.polsl.projectmanagement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.polsl.projectmanagement.dto.ChangePasswordRequest;
import pl.polsl.projectmanagement.security.UserDetailsImpl;
import pl.polsl.projectmanagement.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/me/password")
    public ResponseEntity<String> changePassword(

            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(
                userDetails.getId(),
                request.currentPassword(),
                request.newPassword()
        );

        return ResponseEntity.ok("Password changed successfully.");
    }
}