/*
Copyright 2023 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { useEffect, useMemo } from "react";

import { setLocalStorageItem, useLocalStorage } from "../useLocalStorage";
import { useClient } from "../ClientContext";
import { useUrlParams } from "../UrlParams";
import { widget } from "../widget";

export const getRoomSharedKeyLocalStorageKey = (roomId: string): string =>
  `room-shared-key-${roomId}`;

const useInternalRoomSharedKey = (roomId: string): string | null => {
  const key = getRoomSharedKeyLocalStorageKey(roomId);
  const roomSharedKey = useLocalStorage(key)[0];

  return roomSharedKey;
};

/**
 * Extracts the room password from the URL if one is present, saving it in localstorage
 * and returning it in a tuple with the corresponding room ID from the URL.
 * @returns A tuple of the roomId and password from the URL if the URL has both,
 *          otherwise [undefined, undefined]
 */
const useKeyFromUrl = (): [string, string] | [undefined, undefined] => {
  const urlParams = useUrlParams();

  useEffect(() => {
    if (!urlParams.password || !urlParams.roomId) return;
    if (!urlParams.roomId) return;

    setLocalStorageItem(
      // We set the Item by only using data from the url. This way we
      // make sure, we always have matching pairs in the LocalStorage,
      // as they occur in the call links.
      getRoomSharedKeyLocalStorageKey(urlParams.roomId),
      urlParams.password,
    );
  }, [urlParams]);

  return urlParams.roomId && urlParams.password
    ? [urlParams.roomId, urlParams.password]
    : [undefined, undefined];
};

export const useRoomSharedKey = (roomId: string): string | undefined => {
  // make sure we've extracted the key from the URL first
  // (and we still need to take the value it returns because
  // the effect won't run in time for it to save to localstorage in
  // time for us to read it out again).
  const [urlRoomId, passwordFormUrl] = useKeyFromUrl();

  const storedPassword = useInternalRoomSharedKey(roomId);

  if (storedPassword) return storedPassword;
  if (urlRoomId === roomId) return passwordFormUrl;
  return undefined;
};

export const useIsRoomE2EE = (roomId: string): boolean | null => {
  const { client } = useClient();
  const room = useMemo(() => client?.getRoom(roomId) ?? null, [roomId, client]);
  // For now, rooms in widget mode are never considered encrypted.
  // In the future, when widget mode gains encryption support, then perhaps we
  // should inspect the e2eEnabled URL parameter here?
  return useMemo(
    () => widget === null && (room === null || !room.getCanonicalAlias()),
    [room],
  );
};
