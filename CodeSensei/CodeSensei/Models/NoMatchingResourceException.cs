using System;

namespace CodeSensei.Models
{
    public class NoMatchingResourceException : Exception
    {
        public NoMatchingResourceException(string message) : base(message)
        {
        }
    }
}