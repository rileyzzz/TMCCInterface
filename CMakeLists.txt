cmake_minimum_required(VERSION 3.13)

project(TMCC CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")

foreach( OUTPUTCONFIG ${CMAKE_CONFIGURATION_TYPES} )
    string( TOUPPER ${OUTPUTCONFIG} OUTPUTCONFIG )
    set( CMAKE_RUNTIME_OUTPUT_DIRECTORY_${OUTPUTCONFIG} "${CMAKE_BINARY_DIR}/bin" )
    set( CMAKE_LIBRARY_OUTPUT_DIRECTORY_${OUTPUTCONFIG} "${CMAKE_BINARY_DIR}/bin" )
    set( CMAKE_ARCHIVE_OUTPUT_DIRECTORY_${OUTPUTCONFIG} "${CMAKE_BINARY_DIR}/bin" )
endforeach( OUTPUTCONFIG CMAKE_CONFIGURATION_TYPES )

set(BIN_DIR ${CMAKE_BINARY_DIR}/bin)

set(TMCC_SOURCES
	include/types.h
	include/TMCCInterface.h
	src/TMCCInterface.cpp)

add_library(TMCC SHARED ${TMCC_SOURCES})

if (WIN32)
target_link_libraries(TMCC PUBLIC SetupAPI.lib)
else()
target_link_libraries(TMCC PUBLIC stdc++fs)
endif()

target_include_directories(TMCC PUBLIC include)

target_compile_definitions(TMCC PRIVATE TMCC_EXPORT=1)

add_subdirectory(demo)

