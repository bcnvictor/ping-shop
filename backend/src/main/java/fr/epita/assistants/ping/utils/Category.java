package fr.epita.assistants.ping.utils;

public class Category {

    public static final int SNACKS = 0;
    public static final int DRINKS = 1;
    public static final int NOODLES = 2;
    public static final int ICE_CREAM = 3;

    public static final String SNACKS_NAME = "Snacks";
    public static final String DRINKS_NAME = "Drinks";
    public static final String NOODLES_NAME = "Noodles";
    public static final String ICE_CREAM_NAME = "Ice-Cream";

    public static String getCategoryName(int categoryId) {
        return switch (categoryId) {
            case SNACKS -> SNACKS_NAME;
            case DRINKS -> DRINKS_NAME;
            case NOODLES -> NOODLES_NAME;
            case ICE_CREAM -> ICE_CREAM_NAME;
            default -> throw new IllegalArgumentException("Invalid category ID: " + categoryId);
        };
    }

}
