from trafficlight.client_types import ElementCall
from trafficlight.internals.client import ElementCallClient
from trafficlight.internals.test import Test
from .handle_invite_base import InviteLinksMixin


class TwoGuestsInviteLinksTest(Test, InviteLinksMixin):
    def __init__(self) -> None:
        super().__init__()
        self._client_under_test([ElementCall()], "alice")
        self._client_under_test([ElementCall()], "bob")

    async def run(self, alice: ElementCallClient, bob: ElementCallClient) -> None:
        await alice.guest_user()
        await bob.guest_user()
        await self._run_test(alice, bob)
