import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AskYourVet assistant. How can I help you today? I can answer questions about pet care, help you book appointments, or provide information about our services."
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Simple response logic (in production, this would connect to Lovable AI)
    setTimeout(() => {
      const botResponse: Message = {
        role: "assistant",
        content: getResponse(input)
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInput("");
  };

  const getResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("appointment") || lowerQuery.includes("book")) {
      return "To book an appointment, please log in to your account and navigate to the appointments section in your dashboard. You can select your preferred veterinarian, date, and time.";
    }
    
    if (lowerQuery.includes("emergency")) {
      return "For emergencies, please call your nearest veterinary clinic immediately. If you're unsure, most areas have 24/7 emergency pet hospitals. Would you like me to help you find contact information?";
    }
    
    if (lowerQuery.includes("vaccine") || lowerQuery.includes("vaccination")) {
      return "Vaccinations are crucial for your pet's health. Core vaccines for dogs include rabies, distemper, and parvovirus. For cats, core vaccines include rabies, feline distemper, and feline herpesvirus. Consult with a veterinarian for a personalized vaccination schedule.";
    }
    
    if (lowerQuery.includes("hours") || lowerQuery.includes("available")) {
      return "Our veterinarians have varying availability. Most are available Monday through Friday, 9 AM to 5 PM. Some also offer weekend appointments. Please check individual vet profiles in the appointments section for specific availability.";
    }
    
    return "I understand your question. For specific medical advice, I recommend booking a consultation with one of our certified veterinarians. Is there anything else I can help you with regarding our platform or general pet care information?";
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-primary z-50"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-lg flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-primary rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
              <h3 className="font-semibold text-primary-foreground">AskYourVet Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
