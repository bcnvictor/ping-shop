package fr.epita.assistants.ping.api.response;

import lombok.*;



// ROLES : 0 = user random, 1 = seller , 2 = admin
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class RoleResponse {
    Integer role;
}

