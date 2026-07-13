package fr.epita.assistants.ping.domain.service;

import fr.epita.assistants.ping.api.response.LoginResponse;
import fr.epita.assistants.ping.data.model.UserModel;
import fr.epita.assistants.ping.data.repository.UserRepository;
import fr.epita.assistants.ping.utils.ErrorInfo;
import io.smallrye.jwt.build.Jwt;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class JwtTokenService {

    @Inject
    UserRepository userRepository;

    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String issuer;

    @ConfigProperty(name = "jwt.duration", defaultValue = "3600")
    Long duration;

    public String generateToken(String userId, boolean isAdmin) {
        long currentTimeInSecs = Instant.now().getEpochSecond();

        String role = isAdmin ? "admin" : "user";

        return Jwt.issuer(issuer)
                .subject(userId)
                .groups(new HashSet<>(List.of(role)))
                .issuedAt(currentTimeInSecs)
                .expiresAt(currentTimeInSecs + duration)
                .sign();
    }

    public String logInUser(String login, String password) {
        UserModel user = userRepository.findByLogin(login);

        if (user == null || !user.getPassword().equals(password)) {
            return null;
        }

        return generateToken(
                user.getId().toString(),
                Boolean.TRUE.equals(user.getIsAdmin())
        );
    }

    public Response refreshUserToken(String userId)
    {
        UUID uuid = null;
        try {
            uuid = UUID.fromString(userId);
        }
        catch (Exception e)
        {
            return Response.status(404)
                    .entity(new ErrorInfo("The user could not be found"))
                    .build();
        }
        UserModel user = userRepository.findUser(uuid);
        if (user == null)
        {
            return Response.status(404)
                    .entity(new ErrorInfo("The user could not be found"))
                    .build();
        }
        String newToken =  generateToken(
            user.getId().toString(),
            Boolean.TRUE.equals(user.getIsAdmin()));
        return Response.status(200).entity(new LoginResponse(newToken)).build();
    }
}