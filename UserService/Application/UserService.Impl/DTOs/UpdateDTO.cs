using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UserServices.Impl.DTOs
{
  public class UpdateDTO
  {
    public string? UserId { get; set; }
    public string? NewEmail { get; set; }
    public string? NewPassword { get; set; }
  }
}
