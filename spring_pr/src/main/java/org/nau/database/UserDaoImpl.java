package org.nau.database;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.nau.database.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class UserDaoImpl implements UserDao {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public List<User> getAllUsers() {
        Session session = sessionFactory.openSession();
        return (List<User>) session.createQuery("FROM User").list();
    }
}
