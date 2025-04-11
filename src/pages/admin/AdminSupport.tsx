
import { useState } from "react";
import { ChevronLeft, Search, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminNavbar from "@/components/navigation/AdminNavbar";

// Sample support ticket data
const sampleTickets = [
  {
    id: "TKT-001",
    customer: "John Doe",
    subject: "Order not delivered on time",
    date: "2023-04-10",
    status: "Open",
    priority: "High"
  },
  {
    id: "TKT-002",
    customer: "Jane Smith",
    subject: "Wrong item received in package",
    date: "2023-04-09",
    status: "In Progress",
    priority: "Medium"
  },
  {
    id: "TKT-003",
    customer: "Bob Johnson",
    subject: "Refund not processed yet",
    date: "2023-04-08",
    status: "Closed",
    priority: "High"
  },
  {
    id: "TKT-004",
    customer: "Alice Williams",
    subject: "Product damaged during shipping",
    date: "2023-04-07",
    status: "Open",
    priority: "Low"
  }
];

const AdminSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredTickets = sampleTickets.filter(ticket => {
    // First apply text search
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then apply status filter if not "all"
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && ticket.status.toLowerCase() === activeTab.toLowerCase();
  });
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <MessageCircle size={16} className="text-blue-500" />;
      case "In Progress":
        return <Clock size={16} className="text-yellow-500" />;
      case "Closed":
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return null;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="pb-20">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm p-4 flex items-center">
        <h1 className="text-lg font-medium">Customer Support</h1>
      </div>
      
      <div className="pt-16 p-4">
        <Input
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={handleSearch}
          className="mb-4"
        />
        
        <Tabs 
          defaultValue="all" 
          className="mb-4"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{ticket.id}</h3>
                        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                      </div>
                      <p className="font-medium text-sm mt-1">{ticket.subject}</p>
                      <p className="text-sm text-gray-600">{ticket.customer}</p>
                      <p className="text-xs text-gray-500">{ticket.date}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {getStatusIcon(ticket.status)}
                      <span>{ticket.status}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">View Ticket</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      <AdminNavbar />
    </div>
  );
};

export default AdminSupport;
