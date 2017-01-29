namespace CodeSensei.Interfaces
{
    public interface IAggregator
    {
        IUserRepository UserRepository { get; set; }
        IEntitiesRepository EntitiesRepository { get; set; }
        IResourcesRepository ResourcesRepository { get; set; }
        IIntentionsRepository IntentionsRepository { get; set; }
    }
}
