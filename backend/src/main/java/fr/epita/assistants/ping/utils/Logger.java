package fr.epita.assistants.ping.utils;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

import jakarta.inject.Singleton;
import io.quarkus.runtime.Startup;
import jakarta.inject.Inject;
import jakarta.annotation.PostConstruct;
import org.eclipse.microprofile.config.inject.ConfigProperty;


@Singleton
@Startup
public class Logger {
    private static final String RESET_TEXT = "\u001B[0m";
    private static final String RED_TEXT = "\u001B[31m";
    private static final String GREEN_TEXT = "\u001B[32m";
    private static final String YELLOW_TEXT = "\u001B[33m";
    private static final String BLUE_TEXT = "\u001B[34m";

    @Inject
    @ConfigProperty(name = "LOG_FILE", defaultValue = "")
    String logFile;

    @Inject
    @ConfigProperty(name = "ERROR_LOG_FILE", defaultValue = "")
    String errorLogFile;

    private static Logger instance;

    @PostConstruct
    public void init() {
        instance = this;
        System.out.println(String.format("%s[%s] Logger initialized - LOG_FILE: %s, ERROR_LOG_FILE: %s%s",
                GREEN_TEXT, timestamp(), logFile, errorLogFile, RESET_TEXT));
    }


    // pr la testsuite et les contextes ou le logger est testé hors de l'app
    // dans le cas ou  les annotations @Singleton @Startup proc pas ( impossible hors testsuite dans un main )
    private static void ensureInitialized() {
        if (instance == null) {
            instance = new Logger();
            instance.logFile = System.getenv("LOG_FILE");
            instance.errorLogFile = System.getenv("ERROR_LOG_FILE");
            System.out.println("Logger manually initialized (non-CDI environment)");
        }
    }

    private static String timestamp() {
        return new SimpleDateFormat("dd/MM/yy - HH:mm:ss")
                .format(Calendar.getInstance().getTime());
    }

    public static void info(String message) {
        log(GREEN_TEXT, message, true);
    }

    public static void warn(String message) {
        log(YELLOW_TEXT, message, true);
    }

    public static void error(String message) {
        log(RED_TEXT, message, false);
    }

    public static void userAction(String userId, String action, String details) {
        String message = String.format("User[%s] - %s - %s", userId, action, details);
        log(BLUE_TEXT, message, true);
    }

    public static void projectAction(String userId, String projectId, String action, String details) {
        String message = String.format("User[%s] - Project[%s] - %s - %s", userId, projectId, action, details);
        log(BLUE_TEXT, message, true);
    }

    public static void fileSystemAction(String userId, String projectId, String action, String path) {
        String message = String.format("User[%s] - Project[%s] - FILESYS - %s - Path: %s",
                userId, projectId, action, path);
        log(BLUE_TEXT, message, true);
    }

    public static void gitCommand(String userId, String projectId, String command, String params) {
        String message = String.format("User[%s] - Project[%s] - GIT - %s %s",
                userId, projectId, command, params);
        log(BLUE_TEXT, message, true);
    }

    public static void authAttempt(String login, boolean success) {
        String status = success ? "SUCCESS" : "FAILED";
        String color = success ? GREEN_TEXT : RED_TEXT;
        String message = String.format("Auth - Login: %s - %s", login, status);
        log(color, message, success);
    }

    private static void log(String color, String message, boolean success) {
        ensureInitialized();
        String formattedMessage = String.format("%s[%s] %s%s",
                color, timestamp(), message, RESET_TEXT);

        if (success) {
            System.out.println(formattedMessage);
        } else {
            System.err.println(formattedMessage);
        }

        if (instance != null) {
            instance.writeToLogFile(formattedMessage, success);
        }
        else
        {
            System.err.println("UNEXPECTED : Logger instance is null");
        }
    }

    public static void shopPurchase(String buyer, String seller, String cart) {
        String message = String.format("PURCHASE - Buyer: %s, Seller: %s, Cart: %s",
                buyer, seller, cart);
        log(BLUE_TEXT, message, true);
    }

    public static void stockUpdate(String item, int sold, int remaining) {
        String message = String.format("STOCK - Item: %s, Sold: %d, Remaining: %d",
                item, sold, remaining);
        log(YELLOW_TEXT, message, true);
    }

    public static void createdItem(String item) {
        String message = String.format("STOCK - Created item: %s",
                item);
        log(YELLOW_TEXT, message, true);
    }

    public static void restockItem(String item, int added, int remaining) {
        String message = String.format("RESTOCK - Item: %s, Added: %d, Remaining: %d",
                item, added, remaining);
        log(GREEN_TEXT, message, true);
    }

    private void writeToLogFile(String message, boolean success) {
        String targetFile = success ? logFile : errorLogFile;

        if (targetFile == null || targetFile.trim().isEmpty()) {
            return;
        }
        try (PrintWriter out = new PrintWriter(new FileWriter(targetFile, true))) {
            // on enlève la couleur dans le fichier log sinon c illisible, mais c pas obligé
            String cleanMessage = message.replaceAll("\u001B\\[[0-9;]*m", "");
            out.println(cleanMessage);
        } catch (IOException ignored) {
        }
    }
}