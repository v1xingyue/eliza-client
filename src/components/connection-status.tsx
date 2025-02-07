import { cn } from "@/lib/utils";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Activity, Settings } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

export default function ConnectionStatus() {
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [remoteAddress, setRemoteAddress] = useState("");

  useEffect(() => {
    const storedAddress =
      localStorage.getItem("remoteAddress") || "http://localhost:3000";
    setRemoteAddress(storedAddress);
  }, []);

  const query = useQuery({
    queryKey: ["status"],
    queryFn: async () => {
      const start = performance.now();
      const data = await apiClient.getAgents();
      const end = performance.now();
      setQueryTime(end - start);
      return data;
    },
    refetchInterval: 5_000,
    retry: 1,
    refetchOnWindowFocus: "always",
  });

  const connected = query?.isSuccess && !query?.isError;
  const isLoading = query?.isRefetching || query?.isPending;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setRemoteAddress(newAddress);
    localStorage.setItem("remoteAddress", newAddress);
  };

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton>
            <div className="flex flex-col gap-1 select-none transition-all duration-200">
              <div className="flex items-center gap-2">
                <div
                  className={cn([
                    "h-2.5 w-2.5 rounded-full",
                    isLoading
                      ? "bg-muted-foreground"
                      : connected
                      ? "bg-green-600"
                      : "bg-red-600",
                  ])}
                />
                <span
                  className={cn([
                    "text-xs",
                    isLoading
                      ? "text-muted-foreground"
                      : connected
                      ? "text-green-600"
                      : "text-red-600",
                  ])}
                >
                  {isLoading
                    ? "Connecting..."
                    : connected
                    ? "Connected"
                    : "Disconnected"}
                </span>
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <button className="text-xs text-blue-600 underline ml-2">
                      <Settings className="w-5 h-5" />
                    </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                      <Dialog.Title className="text-lg font-medium text-white">
                        Set Remote Address
                      </Dialog.Title>
                      <Dialog.Description className="mt-2 mb-4 text-sm text-gray-300">
                        Enter the remote address below.
                      </Dialog.Description>
                      <input
                        type="text"
                        value={remoteAddress}
                        onChange={handleAddressChange}
                        placeholder="Enter remote address"
                        className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                      />
                      <div className="mt-4 flex justify-end">
                        <Dialog.Close asChild>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Close
                          </button>
                        </Dialog.Close>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>
            </div>
          </SidebarMenuButton>
        </TooltipTrigger>
        {connected ? (
          <TooltipContent side="top">
            <div className="flex items-center gap-1">
              <Activity className="size-4" />
              <span>{queryTime?.toFixed(2)} ms</span>
            </div>
          </TooltipContent>
        ) : null}
      </Tooltip>
    </SidebarMenuItem>
  );
}
