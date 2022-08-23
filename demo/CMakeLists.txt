
project(Demo CXX)

# find_package(Boost COMPONENTS date_time REQUIRED)
# find_package(Boost REQUIRED)
# find_package(websocketpp REQUIRED)

set(DEMO_SOURCES
	demo.cpp)

add_executable(Demo ${DEMO_SOURCES})


# target_link_directories(Demo PUBLIC ${Boost_LIBRARY_DIRS})
target_link_libraries(Demo PUBLIC ../bin/TMCC ${Boost_LIBRARIES})
# target_link_libraries(Demo PUBLIC ../bin/TMCC)

# if (WIN32)
# target_link_libraries(Demo PUBLIC Ws2_32)
# else()

# endif()

# target_include_directories(Demo PUBLIC ../include ${Boost_INCLUDE_DIRS} ${WEBSOCKETPP_INCLUDE_DIR})
target_include_directories(Demo PUBLIC ../include ${Boost_INCLUDE_DIR})
# target_include_directories(Demo PUBLIC ../include)

add_dependencies(Demo TMCC)