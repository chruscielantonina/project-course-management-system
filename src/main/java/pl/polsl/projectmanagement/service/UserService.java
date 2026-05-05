package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.polsl.projectmanagement.model.AppUser;
import pl.polsl.projectmanagement.repository.AppUserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {

        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password cannot be the same as the old password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        appUserRepository.save(user);
    }
}