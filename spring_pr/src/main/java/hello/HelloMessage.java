package hello;

public class HelloMessage {

    private String name;

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "name='" + name + "'";
    }
}