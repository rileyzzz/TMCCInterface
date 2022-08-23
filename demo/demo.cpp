
#include <stdio.h>
//#include <websocketpp/config/asio_no_tls.hpp>
//#include <websocketpp/server.hpp>

#include "TMCCInterface.h"

//typedef websocketpp::server<websocketpp::config::asio> ws_server;
//typedef ws_server::message_ptr message_ptr;
//using websocketpp::lib::placeholders::_1;
//using websocketpp::lib::placeholders::_2;
//
//static void on_message(ws_server* s, websocketpp::connection_hdl hdl, message_ptr msg);

int main(int argc, char* argv[])
{
  printf("Init.\n");
  DeviceInfo* devices;
  int numDevices = TMCCInterface::EnumerateDevices(&devices);
  for (int i = 0; i < numDevices; i++)
  {
    printf("device %s\n", devices[i].GetFriendlyName());
  }
}