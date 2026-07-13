package fr.epita.assistants.ping.api.response;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class UserResponse {
    UUID id;
    String login;
    String displayName;
    Boolean isAdmin;
    String avatar;
}
