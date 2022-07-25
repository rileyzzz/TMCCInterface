
project(TestApp CXX)

set(TESTAPP_SOURCES
	testapp.cpp)

add_executable(TestApp ${TESTAPP_SOURCES})

target_link_libraries(TestApp PUBLIC ../bin/TMCC)
target_include_directories(TestApp PUBLIC ../include)
add_dependencies(TestApp TMCC)