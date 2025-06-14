import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        // Handle different message types
        switch (data.type) {
          case 'RAFFLE_CREATED':
            toast({
              title: 'New Raffle Created',
              description: 'A new raffle has been created!',
            });
            break;
          case 'TICKET_PURCHASED':
            // Update raffle data in real-time
            break;
          case 'DONATION_CREATED':
            toast({
              title: 'New Donation Campaign',
              description: 'A new donation campaign has been started!',
            });
            break;
          case 'DONATION_CONTRIBUTION':
            // Update donation data in real-time
            break;
          case 'RAFFLE_APPROVED':
            toast({
              title: 'Raffle Approved',
              description: 'A raffle has been approved!',
            });
            break;
          case 'CHAT_MESSAGE':
            // Handle chat messages
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
      
      // Attempt to reconnect after 3 seconds without page reload
      setTimeout(() => {
        if (ws.current?.readyState === WebSocket.CLOSED) {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}/ws`;
          
          try {
            ws.current = new WebSocket(wsUrl);
            
            ws.current.onopen = () => {
              setIsConnected(true);
              console.log('WebSocket reconnected');
            };
            
            ws.current.onclose = () => {
              setIsConnected(false);
              console.log('WebSocket disconnected again');
            };
            
            ws.current.onerror = (error) => {
              console.error('WebSocket reconnection error:', error);
              setIsConnected(false);
            };
          } catch (error) {
            console.error('Failed to reconnect WebSocket:', error);
          }
        }
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [toast]);

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}
