package fr.epita.assistants.ping.api.response;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class MemberResponse {
    UUID id;
    String displayName;
    String avatar;
}
