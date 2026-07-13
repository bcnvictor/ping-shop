package fr.epita.assistants.ping.api.response;

import jakarta.persistence.Entity;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class LoginResponse {
    public String token;
}

