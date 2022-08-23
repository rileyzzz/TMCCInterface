#ifndef _TYPES_H_
#define _TYPES_H_
#pragma once

#include <iostream>
#include <cassert>
#include <string>
#include <vector>
#include <stdio.h>
#include <string.h>

#ifdef _MSC_VER
#ifdef TMCC_EXPORT
#define TMCC_API __declspec(dllexport)
#else //!TMCC_EXPORT
#define TMCC_API __declspec(dllimport)
#endif //!TMCC_EXPORT
#else
#define TMCC_API
#endif

typedef unsigned char			  uint8;
typedef unsigned char			  ubyte;
typedef unsigned short			uint16;
typedef unsigned int			  uint32;
typedef unsigned long			  ulong;
typedef unsigned long long	uint64;

typedef char					      int8;
typedef short					      int16;
typedef int						      int32;
typedef long long				    int64;

#ifdef _MSC_VER
#include <intrin.h>
#define bswap_16(x) _byteswap_ushort(x)
#define bswap_32(x) _byteswap_ulong(x)
#define bswap_64(x) _byteswap_uint64(x)

#define ARR_ALIGN __declspec(align(64))
#else
#include <x86intrin.h>
#define bswap_16(x) __builtin_bswap16(x)
#define bswap_32(x) __builtin_bswap32(x)
#define bswap_64(x) __builtin_bswap64(x)

#define ARR_ALIGN __attribute__((aligned(64)))
#endif

#if defined(_WIN32) || defined(_WIN64)
#define WINDOWS
#endif


//#ifdef WINDOWS
//#include <io.h>
//#include <windows.h>
//#define F_OK 0
//#define access _access
//#define sleep Sleep
//#else // !WIN32
//#include <unistd.h>
//#endif // !WIN32
//
//inline bool file_exists(const char* fname)
//{
//    return access(fname, F_OK) == 0;
//}

#endif // _TYPES_H_