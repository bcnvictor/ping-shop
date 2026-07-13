package fr.epita.assistants.ping.utils;

public class TestLoggerManual {

    public static void main(String[] args) {

        System.out.println("1. Test INFO");
        Logger.info("Ceci est une info");

        System.out.println("\n2. Test ERROR");
        Logger.error("Ceci est une error");

        System.out.println("\n3. Test WARNING");
        Logger.warn("Ceci est un warning");

        System.out.println("\n4. Test USER ACTION :");
        Logger.userAction("user123", "CREATE_PROJECT", "Project name: TestProject");

        System.out.println("\n5. Test PROJECT ACTION:");
        Logger.projectAction("user123", "proj456", "FILE_CREATED", "Created Main.java");

        System.out.println("\n6. Test FILE SYSTEM ACTION:");
        Logger.fileSystemAction("user123", "proj456", "DELETE_FOLDER", "/src/old");

        System.out.println("\n7. Test GIT COMMAND:");
        Logger.gitCommand("user123", "proj456", "git commit", "-m 'First commit'");

        System.out.println("\n8. Test AUTHENTICATION:");
        Logger.authAttempt("john.doe", true);
        Logger.authAttempt("invalid.user", false);


        String logFile = System.getenv("LOG_FILE");
        String errorLogFile = System.getenv("ERROR_LOG_FILE");

        if (logFile != null) {
            System.out.println("LOG_FILE est défini: " + logFile);
        } else {
            System.out.println("LOG_FILE n'est pas défini");
        }

        if (errorLogFile != null) {
            System.out.println("ERROR_LOG_FILE est défini: " + errorLogFile);
        } else {
            System.out.println("ERROR_LOG_FILE n'est pas défini");
        }

        for (int i = 0; i < 20; i++) {
            Logger.info("Log numéro " + i);
        }
    }
}