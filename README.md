# xchainger

## What?
Web App to find dependency chains in subject demand in ASU classes


## Why? 

It's that time of the semester again! You need to reserve courses of your choosing but the demand-supply rivals that of Teslas's latest release and within the minute of opening you are left grasping at straws.

You really need CSE-578 and can give away CSE-528 that you took because that's the one you got. Dan needs CS-528 and can give away CS-511. His buddy Joan needs CSE-511 and can give CSE-578. Good thing you know them and get an exchange arranged. What if there existed scores of other students that have complementary needs but don't know about each other to arrange an exchange?

Oh, did we mention the chains can be longer as in A -> B -> C -> D -> E -> A?

This web app aims at bringing together students with complementary needs so that everyone can play Fortnite within the wals of the classroom they want!

To give a mindless Simon Sinek metaphor, "We want happy, stress-free students in the campus. Getting them the subjects they want is what we arrange for!" 

## How?

We aim to exploit elegant graph theory to uncover these chains of students. Mainly based properties of powers of matrices. E.g. A<sup>2</sup> can say which nodes can be walked through after 1-edge walk. We try and see if a node appears in its A<sup>5</sup> to detect chain and let all the nodes know that a match was found for them. 

## When?

Semester ending time.

## Who?

Check the contributors tab. 
