using System.Security.Cryptography;

namespace Authentication.Services;

public static class PasswordHasher
{
    public static (byte[] Hash, byte[] Salt) HashPassword(string password)
    {
        using var rng = RandomNumberGenerator.Create();
        var salt = new byte[16];
        rng.GetBytes(salt);

        using var hmac = new HMACSHA512(salt);
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        return (hash, salt);
    }

    public static bool VerifyPassword(string password, byte[] hash, byte[] salt)
    {
        using var hmac = new HMACSHA512(salt);
        var computed = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        return CryptographicOperations.FixedTimeEquals(computed, hash);
    }
}
