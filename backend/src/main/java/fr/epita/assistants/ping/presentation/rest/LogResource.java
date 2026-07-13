package fr.epita.assistants.ping.presentation.rest;


import fr.epita.assistants.ping.api.response.LogResponse;
import fr.epita.assistants.ping.utils.ErrorInfo;
import fr.epita.assistants.ping.utils.Logger;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


@Produces(MediaType.APPLICATION_JSON)
@Path("/api/logs")
public class LogResource {
    @Inject
    JsonWebToken jwt;

    @Inject
    @ConfigProperty(name = "LOG_FILE", defaultValue = "")
    String logFile;

    @Inject
    @ConfigProperty(name = "ERROR_LOG_FILE", defaultValue = "")
    String errorLogFile;


    @GET
    @Authenticated
    @Path("/app")
    public Response getAppLogs() {

        if (logFile == null || logFile.trim().isEmpty()) {
            return Response.status(404).entity(new ErrorInfo("App log file not found.")).build();
        }

        List<String> logs = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(logFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                logs.add(line);
            }
        } catch (IOException e) {
            Logger.error("Failed to read app log file: " + e.getMessage());
            return Response.status(500).entity(new ErrorInfo("Failed to find & read app log file")).build();
        }

        return Response.ok(new LogResponse(logs)).build();
    }


    @GET
    @Authenticated
    @Path("/error")
    public Response getAppErrorLogs() {

        if (errorLogFile == null || errorLogFile.trim().isEmpty()) {
            return Response.status(404).entity(new ErrorInfo("Error log file not found.")).build();
        }

        List<String> logs = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(errorLogFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                logs.add(line);
            }
        } catch (IOException e) {
            Logger.error("Failed to read Error log file: " + e.getMessage());
            return Response.status(500).entity(new ErrorInfo("Failed to find & read error log file")).build();
        }

        return Response.ok(new LogResponse(logs)).build();
    }
}
