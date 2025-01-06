using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace UserServices.Impl.Models
{
  public class UserModel
  {
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("passwordHash")]
    public string? PasswordHash { get; set; }
  }
}