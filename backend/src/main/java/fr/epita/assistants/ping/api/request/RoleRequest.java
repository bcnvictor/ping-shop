package fr.epita.assistants.ping.api.request;

import lombok.*;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class RoleRequest {
    UUID projectID; // l'ID du projet dans lequel on a les stocks
}

