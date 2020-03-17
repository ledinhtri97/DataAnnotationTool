#!/bin/bash
#backup db
pg_dump -h localhost -U gvlab -W -F t dat_gvlab > gvdat000000.tar
#restore db
pg_restore -d dat_gvlab gvdat000000.tar -c -U gvlab -h localhost -n public
