package fr.epita.assistants.ping.api.request;


import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class LoginRequest {
    public String login;
    public String password;
}
