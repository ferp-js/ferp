## Ferp Extra Types

### Message

The `Message` class is a utility to handle update messages in the app.
The class has the following attributes:

| Attribute                                         | Returns  |
| ------------------------------------------------- | -------- |
| Message.integrate(message, state)                 | A tuple of `[nextState, effect]`. Should override.    |
| Message.isMessage(message)                        | Internally validates that the message being processed extends `Message`    |
| Message.integrateMessage(Klass, message, state)   | Internally integrates a message either as a function or as a class. |
| Message.matchType(Klass, message)                 | Internally matches a message to a valid message type given from process call. |
| Message.process(types)                            | Creates an update handler that checks each message for a valid type and integrates that state. |
| Message#constructor()                             | Base constructor. |

When creating new messages, your sub-class should set meaningful attributes in the constructor, and implement an integrate static method that handles only it's own type.
