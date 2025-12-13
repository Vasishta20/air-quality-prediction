class User:
    def __init__(self, user_id: int, name: str, email: str):
        self.user_id = user_id
        self.name = name
        self.email = email

    def display(self) -> None:
        print(f"User[{self.user_id}] {self.name} <{self.email}>")

    def update_email(self, new_email: str) -> None:
        self.email = new_email


# Usage
user = User(1, "Kireeti", "kireeti@example.com")
user.display()
user.update_email("kireeti.new@example.com")
user.display()
