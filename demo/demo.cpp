
#include <stdio.h>
#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>

#include "TMCCInterface.h"

typedef websocketpp::server<websocketpp::config::asio> ws_server;
typedef ws_server::message_ptr message_ptr;
using websocketpp::lib::placeholders::_1;
using websocketpp::lib::placeholders::_2;

static void on_message(ws_server* s, websocketpp::connection_hdl hdl, message_ptr msg);

int main(int argc, char* argv[])
{
  //printf("Init.\n");
  //DeviceInfo* devices;
  //int numDevices = TMCCInterface::EnumerateDevices(&devices);
  //for (int i = 0; i < numDevices; i++)
  //{
  //  printf("device %s\n", devices[i].GetFriendlyName());
  //}

  // server endpoint
  ws_server server;

  try
  {
    // Set logging settings
    server.set_access_channels(websocketpp::log::alevel::all);
    server.clear_access_channels(websocketpp::log::alevel::frame_payload);

    // Initialize Asio
    server.init_asio();

    // Register our message handler
    server.set_message_handler(websocketpp::lib::bind(&on_message, &server, ::_1, ::_2));

    // Listen on port 9002
    const int port = 9002;
    server.listen(port);
    printf("Opened websocket server on port %d.\n", port);

    // Start the server accept loop
    server.start_accept();

    // Start the ASIO io_service run loop
    server.run();
  }
  catch (websocketpp::exception const& e)
  {
    printf("websocket exception: %s\n", e.what());
  }
  //catch (...)
  //{
  //  std::cout << "other exception" << std::endl;
  //}
}

// Define a callback to handle incoming messages
static void on_message(ws_server* s, websocketpp::connection_hdl hdl, message_ptr msg)
{
  std::cout << "on_message called with hdl: " << hdl.lock().get()
    << " and message: " << msg->get_payload()
    << std::endl;

  // check for a special command to instruct the server to stop listening so
  // it can be cleanly exited.
  if (msg->get_payload() == "stop-listening")
  {
    s->stop_listening();
    return;
  }

  try {
    s->send(hdl, msg->get_payload(), msg->get_opcode());
  }
  catch (websocketpp::exception const& e) {
    std::cout << "Echo failed because: "
      << "(" << e.what() << ")" << std::endl;
  }
}