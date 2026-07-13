package fr.epita.assistants.ping.domain.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.opencsv.CSVWriter;
import fr.epita.assistants.ping.api.response.FileResponse;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Stream;

@ApplicationScoped
public class FolderService {

    @ConfigProperty(name="PROJECT_DEFAULT_PATH", defaultValue="/var/www/projects/")
    String projectDefaultPath;

    public List<FileResponse> getChildren(String project, String path) {
        Path root = Paths.get(projectDefaultPath, project, path);
        List<FileResponse> files = new ArrayList<>();
        try(Stream<Path> paths = Files.list(root)) {
            paths.forEach(file -> {
                Path p = Paths.get(path, file.getFileName().toString());
                files.add(new FileResponse(file.getFileName().toString(),
                        p.toString(),
                        Files.isDirectory(file)));
            });
        } catch (Exception e) {
            System.err.println(e);
            return null;
        }
        return files;
    }

    public boolean createFolder(String project, String path) {
        try{
            Path fullPath = Paths.get(projectDefaultPath ,project, path);
            if (Files.exists(fullPath)) {
                return false;
            }
            Files.createDirectories(fullPath);
            return true;
        }catch(Exception e){
            System.err.println(e);
            return false;
        }
    }

    public int deleteFolder(String project, String path) {
        try{
            Path root = Paths.get(projectDefaultPath, project);
            Path fullPath = Paths.get(projectDefaultPath,project, path);
            Path basePath = Paths.get(projectDefaultPath, project).toRealPath();
            Path userPath = basePath.resolve(path).normalize();

            if (!(userPath.startsWith(basePath))) {
                return 3;
            }
            Files.walk(fullPath)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
            if (!Files.exists(root)){
                Files.createDirectory(root);
            }
            return 0;
        }catch(Exception e){
            System.err.println(e);
            return 1;
        }
    }

    public int moveFolder(String project, String src, String dest) {
        try{
            Path basePath = Paths.get(projectDefaultPath, project).toRealPath();
            Path suserPath = basePath.resolve(src).normalize();
            Path duserPath = basePath.resolve(dest).normalize();

            if (!(suserPath.startsWith(basePath)) ||!(duserPath.startsWith(basePath))) {
                return 3;
            }
            Path srcPath = Paths.get(projectDefaultPath, project, src);
            Path destPath = Paths.get(projectDefaultPath, project, dest);
            if (Files.exists(destPath)){
                return 1;
            }
            Files.move(srcPath, destPath);
            return 0;
        }catch(Exception e){
            System.err.println(e);
            return 2;
        }
    }

    public String combineJsonFiles(String projectId) {
        ObjectMapper mapper = new ObjectMapper();
        ArrayNode resultArray = mapper.createArrayNode();

        try (Stream<Path> paths = Files.walk(Paths.get(projectDefaultPath, projectId))) {
            paths.filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".json"))
                    .forEach(path -> {
                        try {
                            JsonNode jsonNode = mapper.readTree(path.toFile());
                            resultArray.add(jsonNode);
                        } catch (IOException e) {
                            System.err.println("Error reading file: " + path + " - " + e.getMessage());
                        }
                    });
        } catch (IOException e) {
            return "[]";
        }

        try {
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(resultArray);
        } catch (IOException e) {
            return "[]";
        }
    }

    public byte[] jsonToCsv(String projectId) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        String jsonString = combineJsonFiles(projectId);
        JsonNode jsonArray = mapper.readTree(jsonString);

        StringWriter stringWriter = new StringWriter();
        CSVWriter csvWriter = new CSVWriter(stringWriter);

        if (!jsonArray.isEmpty()) {
            JsonNode firstItem = jsonArray.get(0);
            List<String> headers = new ArrayList<>();
            Iterator<String> fieldNames = firstItem.fieldNames();
            while (fieldNames.hasNext()) {
                headers.add(fieldNames.next());
            }

            csvWriter.writeNext(headers.toArray(new String[0]));

            for (JsonNode item : jsonArray) {
                String[] row = new String[headers.size()];
                for (int i = 0; i < headers.size(); i++) {
                    JsonNode field = item.get(headers.get(i));
                    row[i] = field != null ? field.asText() : "";
                }
                csvWriter.writeNext(row);
            }
        }

        csvWriter.close();

        return stringWriter.toString().getBytes();
    }

}
