import { useEffect, useState } from "react";
import "./App.css";
import supabaseClient from "./supabaseConfig";

function App() {
  const [textAreaValue, setTextAreaValue] = useState<{
    id: Number;
    title: string;
  }>();
  const notesTable = supabaseClient.from("Note");

  const broadCastMessage = () => {
    supabaseClient.channel("test-channel").send({
      type: "broadcast",
      event: "shout",
      payload: {
        message: "Hello world",
      },
    });
  };
  useEffect(() => {
    const broadcastChannel = supabaseClient
      .channel("test-channel")
      .on("broadcast", { event: "shout" }, (payload) => {
        console.log("Received broadcast message:", payload);
      })
      .subscribe();
    const databaseChannel = supabaseClient
      .channel("database-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          table: "Note",
          schema: "public",
        },
        (payload) => {
          const newData = payload.new;
          setTextAreaValue({
            id: newData.id,
            title: newData.title,
          });
        }
      )
      .subscribe();
    const fetchData = async () => {
      const { data } = await notesTable.select();
      if (data) {
        setTextAreaValue({
          id: data[0].id,
          title: data[0].title,
        });
      }
    };
    fetchData();
    return () => {
      supabaseClient.removeChannel(databaseChannel);
      broadcastChannel.unsubscribe();
    };
  }, []);
  return (
    <>
      {textAreaValue && (
        <div>
          <textarea
            value={textAreaValue.title}
            onChange={(e) => {
              setTextAreaValue({ ...textAreaValue, title: e.target.value });
            }}
          />
          <button
            onClick={async () =>
              await notesTable
                .update({ title: textAreaValue.title })
                .eq("id", textAreaValue.id)
            }
          >
            Update
          </button>
        </div>
      )}
      <button onClick={broadCastMessage}>Broadcast Message</button>
    </>
  );
}

export default App;
