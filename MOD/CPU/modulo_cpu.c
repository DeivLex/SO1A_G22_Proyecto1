#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/module.h>
#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/sched/signal.h>
#include <linux/sched.h>
#include <linux/fs.h>

MODULE_LICENSE("PY1");
MODULE_AUTHOR("MIGUEL ANGEL");
MODULE_DESCRIPTION("Modulo que muestra la los procesos");
MODULE_VERSION("1");

struct task_struct *task; //Estructura definida en sched.h para tareas/procesos
struct task_struct *childtask; //Estructura necesaria para iterar a travez de procesos secundarios
struct task_struct *memtask; 
struct list_head *list; //Estructura necesaria para recorrer cada lista de tareas tarea->estructura de hijos

//Mostrar PID, nombre, PID del padre y estado
static int write_cpu(struct seq_file * cpufile, void *v){
	/*int p = 0;
	int p2 = 0;
	seq_printf(cpufile, "[\n");
	for_each_process( task ){
		/*if(p==0){
			seq_printf(cpufile, "{\n");
			p = 1;
		}else{
			seq_printf(cpufile, ",\n{\n");
		}
			seq_printf(cpufile, "\"nombre\": \"%s\",\n", task->comm);
			seq_printf(cpufile, "\"pid\": %d,\n", task->pid);
			seq_printf(cpufile, "\"padre\": %d,\n", task->pid);
			seq_printf(cpufile, "\"estado\": %ld,\n", task->state);
			
			seq_printf(cpufile, "\"hijos\":\n");
			seq_printf(cpufile, "\t[\n");
			*
		
			if(p2==1){
				seq_printf(cpufile, ",\n");
			}
			p2 = 0;

			list_for_each( list,&task->children ){
				if(p2==0){
					seq_printf(cpufile, "\t{\n");
					p2 = p2 + 1;
				}else{
					seq_printf(cpufile, ",\n\t{\n");
				}
				childtask= list_entry( list, struct task_struct, sibling);
				seq_printf(cpufile, "\t\"nombre\": \"%s\",\n", childtask->comm);
				seq_printf(cpufile, "\t\"pid\": %d,\n", childtask->pid);
				seq_printf(cpufile, "\t\"padre\": %d,\n", task->pid);
				seq_printf(cpufile, "\t\"estado\": %ld\n", childtask->state);
				seq_printf(cpufile, "\t}");
			}
			

			/*seq_printf(cpufile, "\t]\n");
		
		seq_printf(cpufile, "}");*
	}
	
	seq_printf(cpufile, "]");

	return 0;*/
	
	int p = 0;
	seq_printf(cpufile, "[\n");
	for_each_process( task ){
		if(p == 0){
			p = 1;
		}else if(p == 1){
			seq_printf(cpufile, "},\n");
		}

		seq_printf(cpufile, "{\n");
		seq_printf(cpufile, "\"nombre\": \"%s\",\n",task->comm);
		seq_printf(cpufile, "\"pid\": %d,\n",task->pid);
		seq_printf(cpufile, "\"padre\": %d,\n",task->pid);
		seq_printf(cpufile, "\"estado\": %ld,\n",task->state);
		seq_printf(cpufile, "\"hijo\":\n");
		seq_printf(cpufile, "\t[\n");

		int p2 = 0;
		list_for_each( list,&task->children ){
			if(p2 == 0){
				p2 = 1;
			}else if(p2 == 1){
				seq_printf(cpufile, "\t},\n");
			}

			seq_printf(cpufile, "\t{\n");
			childtask= list_entry( list, struct task_struct, sibling );
			
			seq_printf(cpufile, "\t\"nombre\": \"%s\",\n",childtask->comm);
			seq_printf(cpufile, "\t\"pid\": %d,\n",childtask->pid);
			seq_printf(cpufile, "\t\"padre\": %d,\n",task->pid);
			seq_printf(cpufile, "\t\"estado\": %ld\n",childtask->state);
			
		}
		if(p2 == 1){
			seq_printf(cpufile, "\t}\n");
		}
		seq_printf(cpufile, "\t]\n");
		
	}
	seq_printf(cpufile, "}\n");
	seq_printf(cpufile, "]");

	return 0;
}

static int my_proc_open(struct inode *inode, struct file*file){
	return single_open(file, write_cpu, NULL);	
}

static ssize_t my_proc_write(struct file *file, const char __user *buffer, size_t count, loff_t *f_pos)
{
    return 0;
}

static struct file_operations my_fops = {
    .owner = THIS_MODULE,
    .open = my_proc_open,
    .release = single_release,
    .read = seq_read,
    .llseek = seq_lseek,
    .write = my_proc_write
};

static int __init cpu_mod_init(void){ //modulo de inicio
	struct proc_dir_entry *entry;
    entry = proc_create("cpu_proyecto1", 0, NULL, &my_fops);
	
	if(!entry){
        return -1;
    }else{
		printk(KERN_INFO "@cpu_proyecto1 lectura de cpu iniciado");
    }
    return 0;
}

static void __exit cpu_mod_exit(void){
	remove_proc_entry("cpu_proyecto1", NULL);
	printk(KERN_INFO "@cpu_proyecto1 lectura de cpu finalizado");
}

module_init(cpu_mod_init);
module_exit(cpu_mod_exit);