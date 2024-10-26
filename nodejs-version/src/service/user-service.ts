const users = new Map<string, string>([
    ["ian", "ian"],
    ["dan", "dan"],
    ["chris", "chris"],
]);

export class UserService {
    /**
     * Says whether the combination of login and password is correct.
     */
    areCredentialsCorrect(login: string, password: string): boolean {
        return users.has(login) && users.get(login) == password;
    }
}
