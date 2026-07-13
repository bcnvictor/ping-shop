package fr.epita.assistants.ping.utils;

public class Format {
     public static String generateDisplayNameFromLogin(String login) {
        if (login == null || !login.matches("^[^._]+[._][^._]+$")) {
            return login; // je prefere pas creer une erreur comme un enculé ici, si le login est pourri on le transforme juste pas
        }

        String[] parts = login.split("[._]");
        return capitalizeFirstLetter(parts[0]) + " " + capitalizeFirstLetter(parts[1]);
    }

    private static String capitalizeFirstLetter(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
    public static boolean isValidLogin(String login) {
        return login != null && login.matches("^[^._]+[._][^._]+$");
    }


    private static void fRedaD()
    {
        System.out.println("t'as plus d'agrafes bouffon");
    }
}
