package fr.epita.assistants.ping.api.request;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@RegisterForReflection
@Getter
@Setter
public class ManageUserRequest {
    UUID userId;
}
