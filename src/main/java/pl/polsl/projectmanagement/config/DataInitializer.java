package pl.polsl.projectmanagement.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pl.polsl.projectmanagement.model.AccountType;
import pl.polsl.projectmanagement.model.AppUser;
import pl.polsl.projectmanagement.repository.AppUserRepository;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (!appUserRepository.existsByAccountType(AccountType.ADMIN)) {
            AppUser defaultAdmin = new AppUser();
            defaultAdmin.setEmail("admin@polsl.pl");
            defaultAdmin.setPassword(passwordEncoder.encode("haslo123"));
            defaultAdmin.setAccountType(AccountType.ADMIN);

            appUserRepository.save(defaultAdmin);
        }
    }
}