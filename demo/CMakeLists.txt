
project(Demo CXX)

# find_package(Boost COMPONENTS date_time REQUIRED)
find_package(Boost REQUIRED)
# find_package(websocketpp REQUIRED)

set(DEMO_SOURCES
	demo.cpp)

add_executable(Demo ${DEMO_SOURCES})

if (WIN32)
target_link_libraries(Demo PUBLIC TMCC ${Boost_LIBRARIES})
else()
target_link_libraries(Demo PUBLIC TMCC pthread ${Boost_LIBRARIES})
endif()

# target_include_directories(Demo PUBLIC ../include ${Boost_INCLUDE_DIRS} ${WEBSOCKETPP_INCLUDE_DIR})
target_include_directories(Demo PUBLIC ../include ${Boost_INCLUDE_DIR})
# target_include_directories(Demo PUBLIC ../include)

add_dependencies(Demo TMCC)