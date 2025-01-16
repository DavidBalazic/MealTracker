using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace UserServices.Impl.Models
{
    public class UserModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; } // User identifier (used as 'sub' in claims)

        [BsonElement("email")]
        public string? Email { get; set; } // User's email (used as 'name' in claims)

        [BsonElement("passwordHash")]
        public string? PasswordHash { get; set; } // Hashed password for secure storage

        [BsonElement("role")]
        public string? Role { get; set; } // User's role (used as 'role' in claims)
    }
}