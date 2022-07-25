
#include <stdio.h>
#include "TMCCInterface.h"

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