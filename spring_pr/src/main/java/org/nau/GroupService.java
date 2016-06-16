package org.nau;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Operations with groups.
 */
public class GroupService {
    /**
     * Returns a list of users that belong to a specified group.
     *
     * @param groupId ID of a group
     * @return a list of names of the users
     */
    public List<String> getUsersOfGroup(String groupId) {
        if (groupId.equals("1")) {
            return Arrays.asList(new String[]{"ian", "dan", "chris"});
        }
        return new ArrayList<>();
    }
}
