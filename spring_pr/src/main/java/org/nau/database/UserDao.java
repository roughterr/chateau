package org.nau.database;

import org.nau.database.model.User;

import java.util.List;

public interface UserDao {
    List<User> getAllUsers();
}
