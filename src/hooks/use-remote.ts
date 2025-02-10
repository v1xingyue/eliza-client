import { useEffect } from "react";

export default function useRemote() {
  const updateRemoteByUrl = async () => {
    const remote = location.search.split("remote=")[1];
    if (remote) {
      localStorage.setItem("remoteAddress", remote);
    }
  };

  useEffect(() => {
    updateRemoteByUrl();
  }, []);

  return null;
}
